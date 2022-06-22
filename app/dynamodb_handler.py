from typing import Dict, List
import boto3
from uuid import uuid4


class DynamoDBHandler:
    def __init__(self, table_name: str):
        dynamodb = boto3.resource("dynamodb")
        self._table = dynamodb.Table(table_name)

    def list_books(self) -> List[Dict]:
        response = self._table.scan()
        return response.get("Items")

    def add_book(self, book: Dict) -> Dict:
        book["itemId"] = str(uuid4())
        self._table.put_item(Item=book)
        return book

    def get_book(self, id: str):
        response = self._table.get_item(Key={"itemId": id})
        return response.get("Item")

    def delete_book(self, id: str):
        self._table.delete_item(Key={"itemId": id})
