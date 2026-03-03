from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StudentRequest
from .serializers import StudentRequestSerializer


class StudentRequestView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(request.user, "role", "")

        if request.user.is_superuser:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        if role == "admin":
            queryset = StudentRequest.objects.all()
        elif role == "coordonnateur":
            filiere = (getattr(request.user, "filiere", "") or "").strip()
            if not filiere:
                return Response(
                    {"detail": "Coordinator filiere is missing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = StudentRequest.objects.filter(filiere__iexact=filiere)
        elif role == "etudiant":
            queryset = StudentRequest.objects.filter(student=request.user)
        else:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        try:
            page_size = int(request.query_params.get("page_size", 50))
        except (TypeError, ValueError):
            page_size = 50
        page_size = min(max(page_size, 1), 200)

        paginator = PageNumberPagination()
        paginator.page_size = page_size
        paginated = paginator.paginate_queryset(queryset, request)
        serializer = StudentRequestSerializer(paginated, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        role = getattr(request.user, "role", "")
        if request.user.is_superuser or role != "etudiant":
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentRequestSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(student=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
