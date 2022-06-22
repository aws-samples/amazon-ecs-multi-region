from os import getenv
import boto3

DYNAMODB_TABLE_NAME = getenv("DYNAMODB_TABLE_NAME")
AWS_REGION = boto3.Session().region_name
