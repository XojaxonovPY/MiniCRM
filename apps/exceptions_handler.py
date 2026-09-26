from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from db.exceptions import DatabaseException


def exception_handler(app: FastAPI):
    @app.exception_handler(DatabaseException)
    def database_exceptions(request: Request, exc: DatabaseException):
        return JSONResponse(status_code=exc.code, content={'message': exc.message})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = {}
        for err in exc.errors():
            field = err["loc"][-1]
            errors[field] = err["msg"]

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "status": "error",
                "errors": errors
            }
        )
