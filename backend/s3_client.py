import boto3
from botocore.client import BaseClient
from typing import BinaryIO, Optional

from config import settings


def get_s3_client() -> BaseClient:
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def upload_stream(bucket: str, key: str, stream: BinaryIO, content_type: Optional[str] = None) -> None:
    client = get_s3_client()
    extra = {"ContentType": content_type} if content_type else None
    client.upload_fileobj(stream, bucket, key, ExtraArgs=extra)


def get_object_stream(bucket: str, key: str) -> BinaryIO:
    client = get_s3_client()
    obj = client.get_object(Bucket=bucket, Key=key)
    return obj["Body"]



def delete_object(bucket: str, key: str) -> None:
    client = get_s3_client()
    client.delete_object(Bucket=bucket, Key=key)

