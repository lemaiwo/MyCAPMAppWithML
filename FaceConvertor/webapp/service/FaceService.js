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
		}
	});
	return new FaceService();
});