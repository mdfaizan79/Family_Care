/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 */

/**
 * Middleware to require a specific role for access
 * @param {string|string[]} roles - Single role or array of roles that can access the route
 * @returns {function} Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }

    // Convert roles parameter to array if it's a string
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      next(); // Role is allowed, continue to the next middleware/route handler
    } else {
      return res.status(403).json({ 
        message: 'Forbidden - You do not have permission to access this resource'
      });
    }
  };
};

module.exports = {
  requireRole
};
