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

function getITN(dtl) {
	const position = dtl.indexOf(aitn);
	if (position !== -1) {
		const rem = dtl.substring(position + aitn.length);
		const regex = /[a-zA-Z0-9]+/gm;
		const found = rem.match(regex);
		return (found.length && found[0]) || "";
	}
	return "";
}

function getStatus(dtl) {
	const regex1 = /Response Code\s*:\s*9\d{2}/gm;
	const position = dtl.search(regex1);
	if (position !== -1) {
		const rem = dtl.substring(position + dtl.match(regex1)[0].length);
		const regex2 = /Narrative Text\s*:\s*/gm;
		regex2.test(rem);
		const idx = regex2.lastIndex;
		if (idx) {
			return rem.substring(idx, rem.indexOf(aitn)).trim();
		}
	}
	return "";
}

module.exports = ({ aesContent, mgyShipmentGuid }) => {
	return {
		Comments: aesContent.ResponseMessage,
		Data: aesContent.ResponseDetails,
		ExtensionId,
		TransactionType: "Acelynk message",
		AESITNNumber: getITN(aesContent.ResponseDetails),
		AESStatus: getStatus(aesContent.ResponseDetails),
		AESXTNNumber: aesContent.TransactionID,
		ToBeDecided: aesContent.RequestCorrelationID,
		AESFilingDate: toDate(aesContent.CreatedDateTime),
		WayBill: mgyShipmentGuid,
	};
};
