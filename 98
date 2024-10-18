#!/usr/bin/env node

import OpenAI from "openai";
import dbClient from "./db.js";
import crypto from 'crypto';
import fs from 'fs';
import {parse} from 'csv-parse';
import path from 'path';

const [,,csvFileName='commands.csv', InDir='InDir'] = process.argv;
const openAI = new OpenAI();

const createMessagesArray = (systemCommand, userCommand)=>{
	return [{role:'system', content: systemCommand}, {role: 'user', content: userCommand}]
}

const getAPIResponse = (messages) => openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages 
});

const getTextBw = (masterText, split1, split2) =>{
	let text = masterText?.split(split1)[1] || '';
	const splitted = text.split(split2);
	return {text: splitted[0], remaining: splitted[1]}
}

const insertToAI_Responses = async (project, sys_com, usr_com, response, user) => {
	try{
		await dbClient.connect();
		const ai_response_id = crypto.randomUUID();
		const res = await dbClient.query(`insert into ai_responses(id, project_name, sys_command, usr_command, ai_response, "user") values($1, $2, $3, $4, $5, $6)`,[ai_response_id, project, sys_com, usr_com, response, user]);
		dbClient.end();
		return ai_response_id;
	}catch(e){
		console.log('Props:', project, response, user);
		console.error('Error writing to DB: ',e);
	}
}

const getAllFiles = function(dirPath, arrayOfFiles) {
  const  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

const getCodeFromDirectory = async () => {
	let allContent = '';
	const fileNames = getAllFiles(InDir);
	for(let fileName of fileNames){
		const content = await fs.readFileSync(`${fileName}`, {encoding: 'utf-8'});
		allContent+= `<---file--->\n`+content+'\n </---file--->\n';
	}
	return allContent
}

const getCodeFromDBForExecutionId = async (lastCodeExecutionId) => {
	const res = await dbClient.query("select ai_response from ai_responses where id = $1", [lastCodeExecutionId]);
	const message = res.rows[0].ai_response.choices[0].message.content;
	const {text} = getTextBw(message, "<CODE_BEGIN>", "<CODE_END>");
	return text
}

const addCodeBeginEndTags = (text) => "<CODE_BEGIN>"+text+"<CODE_END> ";

const getMessages = async () => {
	const commands = await fs.readFile(csvFileName, (err, data)=>{
		if(err){
			console.error(err);
			return;
		}
		parse(data, {columns: true, trim: true}, async (err, rows) => {
			if(err){
				console.error('Got error in CSV.', err);
			}else{
				let lastCodeExecutionId = '', sys_command = '';
				for(let row of rows){
					if(row['System Command']) sys_command = row['System Command']; 
					if(row['executed'] == 'true'){
						continue;
					}else{
						let usr_command = row['User Command'], lastCodeExecutionId = row['lastCodeExecutionId'];
						let previous_code = '';
						if(lastCodeExecutionId != '') previous_code = await getCodeFromDBForExecutionId(lastCodeExecutionId);
						if(rows.indexOf(row) == rows.length-1 ) previous_code = await getCodeFromDirectory();
						usr_command = addCodeBeginEndTags(previous_code) + usr_command;
						const apiResponse = await getAPIResponse(createMessagesArray(sys_command, usr_command));
						const dbInsertRes = await insertToAI_Responses("TimerMobileReactNative", sys_command, usr_command, apiResponse, "Punyashlok");
						console.log(dbInsertRes);
					}
				}
			}
		});
	});
}

getMessages();

