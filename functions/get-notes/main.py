import json
import boto3
from boto3.dynamodb.conditions import Key
import requests

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion-30145429")


def auth_info(access_token):
    try:
        url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}"
        response = requests.get(url)
        user_info = response.json()
        return user_info
    except Exception as error:
        print(f"An error occurred: {error}")
        return None


def lambda_handler(event, context):
    access_token = event["headers"]["access-token"]
    email = event["queryStringParameters"]["email"]
    try:
        user_info = auth_info(access_token)
        if user_info and user_info['email'] == email:
            res = table.query(KeyConditionExpression=Key("email").eq(email))
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps(res["Items"])
            }
        else:
            return {
                "statusCode": 401,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({"error": "Unauthorized"})
            }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
