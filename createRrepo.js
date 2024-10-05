import OpenAI from "openai";
import dbClient from "./db.js";
import crypto from 'crypto';
import fs from 'fs';
import {parse} from 'csv-parse';

const openAI = new OpenAI();

const createMessagesArray = (systemCommand, userCommand)=>{
	return [{role:'system', content: systemCommand}, {role: 'user', content: userCommand}]
}

const getAPIResponse = (messages) => openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages 
});

const writeFileOrDirectory = (fileName, content) => {
	const allFileParts = fileName.split('/');
	if(allFileParts.length > 1){
		fs.mkdir(directory, { recursive: true })
		.then((d)=>fs.writeFile(fileName, content, (err)=>console.log(err)))
		.catch((err) => console.error('Error creating directory:', err));
	}else{
		fs.writeFile(fileName, content, (err, data)=>console.log(err));
	}
}
const getTextBw = (masterText, split1, split2) =>{
	let text = masterText?.split(split1)[1] || '';
	const splitted = text.split(split2);
	return {text: splitted[0], remaining: splitted[1]}
}

const test = async () => {
	const res = await dbClient.query("select * from ai_responses");
	console.log(res.rows);
}
const insertToAI_Responses = async (project, sys_com, usr_com, response, user) => {
	try{
		const res = await dbClient.query(`insert into ai_responses(id, project_name, sys_command, usr_command, ai_response, "user") values($1, $2, $3, $4, $5, $6)`,[crypto.randomUUID(), project, sys_com, usr_com, response, user]);
		console.log('res: ',res);
	}catch(e){
		console.error('Error: ',e);
	}
	dbClient.end();
}

const getMessages = async () => {
	const commands = await fs.readFile('./commands.csv', (err, data)=>{
		parse(data, {columns: true, trim: true}, async (err, rows) => {
			if(err){
				console.log('Got error in CSV.', err);
			}else{
				console.log('rows: ', rows);
				let lastCodeExecutionId = '', sys_command = '';
				for(let row of rows){
					if(row['System Command']) sys_command = row['System Command']; 
					if(row['executed'] == 'true'){
						lastCodeExecutionId = row['executionId'];
						continue;
					}else{
						let usr_command = row['User Command'];
						let previous_code = '';
						if(lastCodeExecutionId != ''){
							const res = await dbClient.query("select ai_response from ai_responses where id = $1", [lastCodeExecutionId]);
							const message = res.rows[0].ai_response.choices[0].message.content;
							const {text} = getTextBw(message, "<CODE_BEGIN>", "<CODE_END>");
							previous_code = text;
						}
						usr_command = "<CODE_BEGIN>"+previous_code+"<CODE_END> "+usr_command;
						const apiResponse = await getAPIResponse(createMessagesArray(sys_command, usr_command));
						console.log(apiResponse.choices[0].message);
						const dbInsertRes = await insertToAI_Responses("TimerMobileReactNative", sys_command, usr_command, apiResponse, "Punyashlok");
						console.log(dbInsertRes);
					}
				}
			}
		});
	});
}

getMessages();

