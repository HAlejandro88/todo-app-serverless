
import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid';


const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.GREETINGS_TABLE


export const taskList = async (event, context) => {
    
    try {
        const params = {
            TableName: TABLE_NAME,
        }
    
        const items = await dynamo.scan(params).promise()

        console.log(items, 'ITEMS')

        return {
            'statusCode': 200,
            body: JSON.stringify(items.Items),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET" 
            },
        }
    } catch (err) {
        console.log(err);
        return {
            'statusCode': 500,
            'body': JSON.stringify(err),
            headers: {
                "Content-Type": "application/json",
              }
        }
    }
};


export const createTask = async (event, context) => {
    const body = JSON.parse(event.body)
    try {
        const item = { id: uuidv4(), ...body }
        const savedItem = await saveItem(item);

        return {
            'statusCode': 200,
            'body': JSON.stringify(savedItem),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "*"  
            },
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}


export const updateTaskStatus = async (event, context) => {
    console.log(event.pathParameters.id , 'Parameter')
    const id = event.pathParameters.id
    
    console.log(event.body, 'BODY')
    const {title, description,taskStatus} = JSON.parse(event.body)



    const params = {
        TableName: TABLE_NAME,
        Key: { id: id }, 
        UpdateExpression: 'SET #title = :title, #description = :description, #taskStatus = :taskStatus',
        ExpressionAttributeNames: { '#title': 'title', '#description': 'description', '#taskStatus': 'taskStatus' }, 
        ExpressionAttributeValues: { ':title': title, ':description': description, ':taskStatus': taskStatus },
        ReturnValues: 'ALL_NEW', 
    };

    try {
        const result = await dynamo.update(params).promise();
    
        return {
            'statusCode': 200,
            'body': JSON.stringify(result.Attributes),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "*"  
            },
        }
    } catch (error) {
        console.log(error)
        return {
            'statusCode': 500,
            'body': JSON.stringify('Error to update task ' + error),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "*"  
            },
        }
    }
}

export const deleteTask = async (event, context) => {
    try {

        const id = event.pathParameters.id

        const params = {
            TableName: TABLE_NAME,
            Key: { id: id }
        }
        const deleteItem = await dynamo.delete(params).promise();
        return {
            'statusCode': 200,
            'body': JSON.stringify(`TAsk deleted ${deleteItem}`),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "*" 
            },
        }
    } catch (error) {
        
    }
}

const saveItem = async (item) => {
    const params = {
		TableName: TABLE_NAME,
		Item: item
	};

    
    return await dynamo.put(params).promise()
};
