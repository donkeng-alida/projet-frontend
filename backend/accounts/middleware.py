from .audit import log_api_mutation_event


class AuditTrailMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            log_api_mutation_event(request=request, response=response)
        except Exception:
            pass
        return response
