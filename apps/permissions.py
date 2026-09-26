from fastapi import HTTPException, status

from apps.depends import UserSession


class PermissionChecker:
    def __call__(self, current_user: UserSession):
        if not current_user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission")
        return current_user
