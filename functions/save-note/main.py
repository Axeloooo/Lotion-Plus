import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion")


def lambda_handler(event, context):
    email = event["queryStringParameters"]["email"]
    id = event["queryStringParameters"]["id"]
    try:
        data = json.loads(event["body"])
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
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }
