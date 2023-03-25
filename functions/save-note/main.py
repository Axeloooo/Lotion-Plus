import json
import boto3
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
    id = event["queryStringParameters"]["id"]
    try:
        user_info = auth_info(access_token)
        if user_info and user_info['email'] == email:
            data = json.loads(event["body"])
            print(data)
            item = {
                "email": email,
                "id": id,
                "title": data["title"],
                "body": data["body"],
                "last_modified": data["lastModified"]
            }
            res = table.put_item(Item=item)
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({"message": "Item updated successfully"})
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
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }
