#!/usr/bin/env node
// node makeRepoFromAPIResponse.js executionID OutPutDir
import dbClient from "./db.js";
import fs from "fs";

const [,,executionId, OutDirPath='OutDir'] = process.argv;
const writeFileOrDirectory = (fileName, content) => {
	const allFileParts = fileName.split("/");
	if (allFileParts.length > 1) {
		fs.promises
			.mkdir(fileName.substr(0, fileName.lastIndexOf("/")), {
				recursive: true,
			})
			.finally(() =>
				fs.writeFile(fileName, content, "utf8", (err) =>
					console.log("fs: ", err)
				)
			);
	} else {
		fs.writeFile(fileName, content, "utf8", (err, data) =>
			console.error("fs: ", err)
		);
	}
};

const getTextBw = (masterText, split1, split2) => {
	let text = masterText?.split(split1)[1] || "";
	const splitted = text.split(split2);
	return { text: splitted[0], remaining: splitted[1] };
};

const getCode = async (queryId) => {
	dbClient.connect();
	const ai_response = await dbClient.query(
		"select * from ai_responses where id = $1",
		[queryId]
	);
	dbClient.end();
	const res = ai_response.rows[0];
	if(!res) {
		dbClient.end();
		return console.error("No Response with the ID");
	}
	const content = res.ai_response.choices?.[0]?.message.content;
	const { text: code } = getTextBw(content, "<CODE_BEGIN>", "<CODE_END>");
	let method = "",
		remainingCode = code;
	const allmethods = code.split("</---file--->");
	for (let method of allmethods) {
		method = method.replaceAll(/<---file--->/g, "");
		let fileName = method.split("FileName:")?.[1];
		fileName = fileName?.split("\n")?.[0]?.trim();
		fileName && writeFileOrDirectory(`${OutDirPath}/${fileName}`, method);
	}
};

getCode(executionId|| "15714777-e21a-4317-982c-5225761f6467");
