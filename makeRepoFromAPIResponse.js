import dbClient from './db.js';
import fs from 'fs';

const getTextBw = (masterText, split1, split2) =>{
	let text = masterText?.split(split1)[1] || '';
	const splitted = text.split(split2);
	return {text: splitted[0], remaining: splitted[1]}
}

const getCode = async (queryId) => {
	const ai_response = await dbClient.query("select * from ai_responses where id = $1", [queryId]);
	const res = ai_response.rows[0];
	const content = res.assistant_response.choices?.[0]?.message.content;
	const {text: code} = getTextBw(content, "<CODE_BEGIN>","<CODE_END>");
	let method = "", remainingCode = code;
	const allmethods = code.split("</---file--->");
	for(let method of allmethods){
		method = method.replaceAll(/<---file--->/g, '');
		let fileName = method.split("FileName:")?.[1];
		fileName = fileName?.split("\n")?.[0]?.trim();
		fileName && fs.writeFile(`OutDir/${fileName}`, method, 'utf8',(err,data)=>{console.log('fs: ',err,data);});
		console.log('fileName: ',fileName);

		console.log('method: ', method);
	}
	dbClient.end();
}

getCode(process.argv[2] || "15714777-e21a-4317-982c-5225761f6467");


