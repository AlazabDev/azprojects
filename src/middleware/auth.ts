import { Request, Response, NextFunction } from 'express';
import { supabaseServer } from '../lib/supabaseServer.ts';
import { UserRole, AppPermission, ROLE_PERMISSIONS, hasPermission } from '../types/permissions.ts';

export interface AuthUserContext {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  permissions: AppPermission[];
}

export interface AuthRequest extends Request {
  user?: AuthUserContext;
}

/**
 * Helper to extract and verify Supabase JWT token
 */
async function authenticateToken(req: Request): Promise<AuthUserContext | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return null;
  }

  try {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    const user = data.user;
    const metadata = user.user_metadata || {};
    
    // Role comes strictly from verified profile/metadata, defaulting to 'client' (never 'owner')
    const rawRole = (metadata.role || 'client').toLowerCase() as UserRole;
    const role: UserRole = (ROLE_PERMISSIONS[rawRole] ? rawRole : 'client');

    return {
      id: user.id,
      email: user.email || '',
      role,
      displayName: metadata.name || metadata.full_name || user.email?.split('@')[0],
      permissions: ROLE_PERMISSIONS[role] || [],
    };
  } catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
}

/**
 * Middleware: Require valid Supabase authentication
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'جلسة المستخدم غير صالحة أو منتهية. يرجى تسجيل الدخول مجددًا.',
      },
    });
  }

  req.user = user;
  next();
};

/**
 * Middleware: Require one of the specified roles
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'يجب تسجيل الدخول للوصول إلى هذه الواجهة.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء.',
          requiredRoles: allowedRoles,
          currentRole: req.user.role,
        },
      });
    }

    next();
  };
};

/**
 * Middleware: Require a specific system permission
 */
export const requirePermission = (permission: AppPermission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'يجب تسجيل الدخول للوصول إلى هذا المورد.',
        },
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `المستخدم الحالي يفتقر إلى صلاحية: ${permission}`,
          requiredPermission: permission,
          userRole: req.user.role,
        },
      });
    }

    next();
  };
};

/**
 * Middleware: Optional authentication (attaches user if valid token present, otherwise null)
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const user = await authenticateToken(req);
    if (user) {
      req.user = user;
    }
  } catch {
    // Non-blocking
  }
  next();
};
