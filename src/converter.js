const ExtensionId = require("../package.json").name;
const aitn = "Assigned Internal Transaction Number";

function toDate(sd) {
	try {
		return Date.parse(sd);
	} catch (error) {
		console.log(error.message);
		return 0;
	}
}

function getComments(esOnes) {
	const comments = esOnes.reduce((msg, es1) => {
		let desc = '';
		if (es1.responseCode) {
			desc = `Response Code: ${es1.responseCode}; `;
		}
		if (es1.narrativeText) {
			desc += `Narrative Text: ${es1.narrativeText};`;
		}
		msg = msg + (desc && (desc + '\n'));
		return msg;
	}, '');
	return comments;
}

function getITN(esOnes) {
	const itn = esOnes.find( es1 => es1.responseCode >= 900  && es1.responseCode <= 1000);
	return (itn && itn.AESInternalTransactionNo) || '';

}
function getStatus(js) {
	const itn = js.find( es1 => es1.responseCode >= 900  && es1.responseCode <= 1000);
	return (itn && itn.narrativeText) || '';
}

module.exports = async ({ aesContent, mgyShipmentGuid }) => {

	//const jsDetails = await xml2js(aesContent.ResponseDetails);
	const jsDetails = aesContent.esOnes || [];

	return {
		//Comments: aesContent.ResponseMessage,
		Comments: getComments(jsDetails) + aesContent.responseMessage,
		Data: aesContent.responseDetails,
		ExtensionId,
		TransactionType: "Acelynk message",
		AESITNNumber: getITN(jsDetails),
		AESStatus: getStatus(jsDetails),
		AESXTNNumber: aesContent.transactionID,
		ToBeDecided: aesContent.requestCorrelationID,
		AESFilingDate: toDate(aesContent.createdDateTime),
		guid: mgyShipmentGuid,
	};
};
