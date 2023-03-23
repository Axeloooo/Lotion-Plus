import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion")

# PUT
# https://zr5xpblny3rtkvkkls6uhe5vby0vqyoc.lambda-url.ca-central-1.on.aws/


def lambda_handler(event, context):
    email = event["queryStringParameters"]["email"]
    id = event["queryStringParameters"]["id"]
    try:
        data = json.loads(event["body"])
        res = table.update_item(
            Key={
                "email": email,
                "id": id
            },
            UpdateExpression="SET title = :title, content = :content, last_modified = lastModified",
            ExpressionAttributeValues={
                ":title": data["title"],
                ":content": data["content"],
                ":last_modified": data["lastModified"]
            }
        )
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
