from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


def _format_error(code: str, message: str, field: str | None = None, http_status: int = status.HTTP_400_BAD_REQUEST):
    payload = {"error": {"code": code}}
    if field:
        payload["error"]["field"] = field
    if message:
        payload["error"]["message"] = message
    return Response(payload, status=http_status)


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return _format_error("INTERNAL_ERROR", "An unexpected error occurred", None, status.HTTP_500_INTERNAL_SERVER_ERROR)

    if isinstance(response.data, dict):
        if "detail" in response.data and isinstance(response.data["detail"], str):
            return _format_error("ERROR", response.data["detail"], None, response.status_code)
        for field, errors in response.data.items():
            if isinstance(errors, (list, tuple)) and errors:
                message = str(errors[0])
            else:
                message = str(errors)
            return _format_error("FIELD_REQUIRED" if response.status_code == 400 else "ERROR", message, field, response.status_code)

    return response


