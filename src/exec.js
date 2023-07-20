const propAES = ['AESFilingDate', 'AESITNNumber', 'AESStatus', 'AESXTNNumber', 'IsAESSent', 'AMSActionDate'];

function exec(dbhelper) {

    const sh = dbhelper.shipment;
    const cm = dbhelper.common;
    const { dbx, dbw, algorithm: alg } = cm.getHyperionObject();

    function GetShipmentMethod(shipment) {
        switch (shipment.Type) {
            case dbx.Shipping.Shipment.Type.Air:
                return dbx.Message.Customs.Method.Air;
            case dbx.Shipping.Shipment.Type.Ground:
                return dbx.Message.Customs.Method.Ground;
        }
        return dbx.Message.Customs.Method.Ocean;
    };

    async function GetShipmentByGuid(guid) {
        if (!guid) {
            return null;
        }
        const list = dbx.Shipping.Shipment.ListByGuid;
        const found = await sh.getShipmentByGuid(guid);
        return found || null;
    };

    async function saveAESProperties(trans, values) {

        const valid = Object.keys(values).every(key => propAES.some(p => p === key));
        if (!valid) {
            throw new Error('Invalid AES property');
        }

        try {
            let editTrans = dbx.edit(trans);
            Object.keys(values).forEach(key => editTrans[key] = values[key]);
            await dbw.save(editTrans);
            return true;

        } catch (error) {
            console.log(error.message);
            return false;
        }
    }


    const insertCustomMessage = async (guid, data) => {
        let result = false;
        const trans = await GetShipmentByGuid(guid);
        try {
            let customMsg = new dbx.DbClass.CustomsMessage();

            customMsg.Comments = data.Comments;
            customMsg.Data = "<html><body>" + (data.Data || "default") + "</body></html>" ; // Temporary fix until a bug is fixed
            customMsg.ExtensionId = data.ExtensionId;
            //Direction of the message, very likely all on this extension are Incoming
            customMsg.Direction = dbx.Message.Customs.Direction.Incoming;
            //Acelynk message
            customMsg.TransactionType = 'Acelynk message';
            customMsg.Method = GetShipmentMethod(trans);
            customMsg.Shipment = trans;
            await dbw.save(customMsg);
            result = true;
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }

    const insertAESresult = async (trans, data) => {

        const aes = {
            AESFilingDate: data.AESFilingDate,
            AESITNNumber: data.AESITNNumber,
            AESStatus: data.AESStatus,
            AESXTNNumber: data.AESXTNNumber,
            //IsAESSent: true,
        };
        let result = await saveAESProperties(trans, aes);
        return result;
    }

    const doMessageWork = async (data) => {

        const waybill = data.WayBill;

        const trans = await GetShipmentByGuid(waybill);
        if (trans) {
            const step1 = await insertAESresult(trans, data);
            if (step1) {
                const step2 = await insertCustomMessage(waybill, data);
                if (step2) {
                    return { succes: true }
                };
                return {
                    succes: false,
                    message: 'Error inserting Custom Message'
                }
            }
            else {
                return {
                    succes: false,
                    message: 'Error processing Acelynk message'
                }
            }
        }
        return {
            succes: false,
            message: 'Shipment not found'
        };

    }

    return doMessageWork;

}

module.exports = exec;