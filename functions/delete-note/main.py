import boto3
import json

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion-30145429")


def lambda_handler(event, context):
    email = event["queryStringParameters"]["email"]
    id = event["queryStringParameters"]["id"]
    try:
        res = table.delete_item(
            Key={
                "email": email,
                "id": id
            }
        )
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"message": "Item deleted successfully"})
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
