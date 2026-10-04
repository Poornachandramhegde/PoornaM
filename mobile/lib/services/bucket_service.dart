import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/bucket_model.dart';

class BucketService {
  final ApiClient _apiClient;

  BucketService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<BucketItem>> getBucketItems() async {
    final response = await _apiClient.get(ApiConstants.bucketEndpoint);

    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to fetch bucket items');
    }

    if (response.data is Map<String, dynamic> && response.data['data'] is List) {
      final list = response.data['data'] as List;
      return list
          .map((item) => BucketItem.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return [];
  }
}
