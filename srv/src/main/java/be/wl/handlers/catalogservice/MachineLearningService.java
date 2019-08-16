package be.wl.handlers.catalogservice;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.naming.NamingException;

import com.google.gson.Gson;
import com.sap.cloud.sdk.cloudplatform.connectivity.HttpEntityUtil;
import com.sap.cloud.sdk.services.scp.machinelearning.CloudFoundryLeonardoMlServiceType;
import com.sap.cloud.sdk.services.scp.machinelearning.LeonardoMlFoundation;
import com.sap.cloud.sdk.services.scp.machinelearning.LeonardoMlService;
import com.sap.cloud.sdk.services.scp.machinelearning.LeonardoMlServiceType;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MachineLearningService {
	private final Logger logger = LoggerFactory.getLogger(this.getClass());

	public MachineLearningService() {
	}

	private byte[] base64ToBytes(String image) {
		String partSeparator = ",";
		if (image.contains(partSeparator)) {
			String encodedImg = image.split(partSeparator)[1];
			return Base64.getDecoder().decode(encodedImg.getBytes(StandardCharsets.UTF_8));
		}
		return new byte[0];
	}

	private HttpPost getFilePost(String image) {
		String mimetype = image.substring(image.indexOf(":") + 1, image.indexOf(";"));
		String extension = MimeTypesExtensions.getExtensionFromMimeType(mimetype);
		String boundary = "-------------" + System.currentTimeMillis();
		MultipartEntityBuilder builderff = MultipartEntityBuilder.create();
		builderff.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
		builderff.setBoundary(boundary);
		builderff.addBinaryBody("files", this.base64ToBytes(image), ContentType.create(mimetype), "file."+extension);
		HttpPost post = new HttpPost();
		post.setHeader("Content-type", "multipart/form-data; boundary=" + boundary);
		HttpEntity entityf = builderff.build();
		post.setEntity(entityf);
		return post;
	}

	public String getFaceVector(String image) throws NamingException {
		String facefeatures = "";
		LeonardoMlService mlFaceService = LeonardoMlFoundation.create(CloudFoundryLeonardoMlServiceType.TRIAL_BETA,
				LeonardoMlServiceType.FACE_FEATURE_EXTRACTION);

		return mlFaceService.invoke(this.getFilePost(image), new Function<HttpResponse, String>() {
			@Override
			public String apply(HttpResponse httpResponse) {
				try {
					final String responseBody = HttpEntityUtil.getResponseBody(httpResponse);
					final Map<String, Object> responseObject = new Gson().fromJson(responseBody, Map.class);
					final List<Object> predictions = (List<Object>) responseObject.get("predictions");
					final Map<String, Object> prediction = (Map<String, Object>) predictions.get(0);
					final List<Map<String, Object>> faces = (List<Map<String, Object>>) prediction.get("faces");
					final Map<String, Object> face = faces.get(0);
					final ArrayList<Float> feature = (ArrayList<Float>) face.get("face_feature");
					return (String) feature.toString();
				} catch (Exception e) {
					throw new RuntimeException("Failed to retrieve response: " + e.getMessage(), e);
				}
			}
		});
	}
}
