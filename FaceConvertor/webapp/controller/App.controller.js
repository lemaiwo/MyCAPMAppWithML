sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../util/ImageHandler",
	"../service/FaceService",
	"sap/m/MessageToast"
], function (Controller, JSONModel, ImageHandler, FaceService, MessageToast) {
	"use strict";

	return Controller.extend("be.wl.FaceConvertor.controller.App", {
		onInit: function () {
			FaceService.setModel(this.getView().getModel());
		},
		onUploadFace: function (oEvent) {
			this.file = oEvent.getParameter("files")[0];
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("be.wl.FaceConvertor.view.dialog.Face", this);
			}
			this._oDialog.setModel(new JSONModel({
				firstname: "",
				lastname: ""
			}), "face");
			this._oDialog.open();
		},
		onClose: function (oEvent) {
			this._oDialog && this._oDialog.close();
		},
		onSaveFace: function (oEvent) {
			return ImageHandler.resize(this.file)
				.then(function (image) {
					return FaceService.createFace({
						Firstname: this._oDialog.getModel("face").getProperty("/firstname"),
						Lastname: this._oDialog.getModel("face").getProperty("/lastname"),
						Vectors: image.uri,
						Image: "Not used in this demo"
					});
				}.bind(this)).then(function () {
					MessageToast.show("New Face Created!");
				}.bind(this)).catch(function () {
					MessageToast.show("Error occured...");
				}).then(function(){
					//close always
					this.onClose(oEvent);
				}.bind(this));
		}
	});
});