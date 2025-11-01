import random
import string
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.collation import Collation
from dotenv import load_dotenv
from datetime import datetime
import os
import json
import re

# CAUTION:
#   DO NOT MANUALLY USE THE FOLLOWING FUNCTIONS.
#   THEY ARE MEANT TO BE CALLED BY OTHER FUNCTIONS.
#   THAT WOULD APPROPRIATELY CLOSE THE CONNECTION USE.
#   SEE upload_to_mongo() FOR EXAMPLE.

def load_user_password():
    """
    Load the username and password from the .env file
    """
    if not os.path.isfile('.env'):
        print("\n\nError: No .env file found in the repository.\n\n")
        return None, None, None

    load_dotenv(override=True)
    return os.getenv('username'), os.getenv('password'), os.getenv('server_address')

def connect_to_mongo(username = None, password = None, server_address = None, debug = False):
    """
    DESCRIPTION:
        Return the MongoClient object
        Will load username, password, and server_address from environment variables
        or the .env file if not provided as arguments.

    INPUT SIGNATURE:
        username: MongoDB username (string)
        password: MongoDB password (string)
        server_address: MongoDB server address (string)

    OUTPUT SIGNATURE:
        client: MongoClient object

    CAUTION:
        Manually setting username, password, and server_address
        when calling this function is highly discouraged. They are intended
        only to be used for quick connection to different MongoDB deployments
        when testing the application. The recommended way is to set them via
        environment variables (for cloud deployments) or the .env file (for
        local development).
    """

    # If credentials not provided as arguments, try environment variables first
    # then fall back to .env file (for local development)
    if not username or not password or not server_address:
        username, password, server_address = load_user_password()

    # Construct MongoDB connection URI
    uri = f"mongodb+srv://{username}:{password}{server_address}"
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        if debug:
            print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print("UNABLE TO CONNECT TO DATABASE")

    return client

def list_mongo_databases():
    """
    DESCRIPTION:
        List all databases in the MongoDB server.

    OUTPUT SIGNATURE:
        A list of database names (list of strings).
        The function will also print out the list of database names.
    """

    client = connect_to_mongo()

    try:
        database_names = client.list_database_names()
        print("Databases in the MongoDB server:", database_names)
        return database_names
    except Exception as e:
        print(f"Error listing databases: {e}")
        return []
    finally:
        client.close()

def list_mongo_collections(database_name):
    """
    DESCRIPTION:
        List all collections in the specified MongoDB database.

    INPUT SIGNATURE:
        database_name: MongoDB database name (string)

    OUTPUT SIGNATURE:
        A list of collection names (list of strings).
        The function will also print out the list of collection names.
    """

    client = connect_to_mongo()
    db = client[database_name]

    try:
        collection_names = db.list_collection_names()
        print(f"Collections in the database '{database_name}': {collection_names}")
        return collection_names
    except Exception as e:
        print(f"Error listing collections in database '{database_name}': {e}")
        return []
    finally:
        client.close()

def update_sevy_ai_number_of_questions_answered():
    client = connect_to_mongo()
    db = client['SEVY_database']
    collection = db['SEVY_numbers']

    # Find the document with the sevy_ai_answers field and retrieve the current value
    document = collection.find_one({"sevy_ai_answers": {"$exists": True}})

    if document:
        current_value = int(document["sevy_ai_answers"])  # Get the current value of sevy_ai_answers
        new_value = current_value + 1  # Increment the value by 1

        # Update the document with the new value
        collection.update_one(
            {"sevy_ai_answers": current_value},  # Match the document with the current value
            {"$set": {"sevy_ai_answers": new_value}}  # Set the new incremented value
        )
    else:
        print("Document with sevy_ai_answers not found.")
    client.close()