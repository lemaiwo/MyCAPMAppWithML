sap.ui.define([
	"./CoreService"
], function (CoreService) {
	"use strict";

	var FaceService = CoreService.extend("be.wl.FaceConvertor.service.FaceService", {
		constructor: function () {},
		getMaxFaceId: function () {
			return this.odata("/Faces").get({
				urlParameters: {
					$select: "ID",
					$top: 1,
					$orderby: "ID desc"
				}
			});
		},
		createFace: function (oFace) {
			return this.getMaxFaceId().then(function (response) {
				oFace.ID = response.data.results && response.data.results.length > 0 ? ++response.data.results[0].ID : 1;
				return this.odata("/Faces").post(oFace);
			}.bind(this));
		},
		deleteFace: function (id) {
			var sObjectPath = this.model.createKey("/Faces", {
				ID: id
			});
			return this.odata(sObjectPath).delete();
		},
		getBearerToken: function () {
			return this.http("mlauth/oauth/token?grant_type=client_credentials").get({
				"accept": "application/json"
			});
		},
		getFaceFeatures: function (body,originalImage) {
			return this.getBearerToken().then(function (token) {
				var tokenInfo = JSON.parse(token);
				var form = new FormData();
					form.append("files", body,originalImage.name);
					if (form.fd) {
						form = form.fd;
					}
				return this.http("mlapi/api/v2alpha1/image/face-feature-extraction/").post({
					"authorization": "Bearer " + tokenInfo.access_token,
					"accept": "application/json"
				}, form);
			}.bind(this));
		}
	});
	return new FaceService();
});