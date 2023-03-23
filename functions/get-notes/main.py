import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion")

# GET
# https://had54xrk4jqcdt4qpwsgkfwbp40yeodp.lambda-url.ca-central-1.on.aws/


def lambda_handler(event, context):
    try:
        email = event["queryStringParameters"]["email"]
        res = table.query(KeyConditionExpression=Key("email").eq(email))
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(res["Items"])
        }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
