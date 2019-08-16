function initModel() {
	var sUrl = "/CAPMLDemoAPI/odata/v2/CatalogService/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}