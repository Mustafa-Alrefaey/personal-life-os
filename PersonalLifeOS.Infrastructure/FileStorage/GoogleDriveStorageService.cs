using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;

namespace PersonalLifeOS.Infrastructure.FileStorage;

public class GoogleDriveStorageService
{
    private readonly DriveService _driveService;
    private readonly string _folderId;

    public GoogleDriveStorageService(string clientId, string clientSecret, string refreshToken, string folderId)
    {
        _folderId = folderId;

        var credential = new UserCredential(
            new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = new ClientSecrets
                {
                    ClientId = clientId,
                    ClientSecret = clientSecret
                },
                Scopes = [DriveService.Scope.DriveFile]
            }),
            "user",
            new TokenResponse { RefreshToken = refreshToken }
        );

        _driveService = new DriveService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PersonalLifeOS"
        });
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var fileMetadata = new Google.Apis.Drive.v3.Data.File
        {
            Name = $"{Guid.NewGuid()}_{fileName}",
            Parents = [_folderId]
        };

        var request = _driveService.Files.Create(fileMetadata, fileStream, contentType);
        request.Fields = "id";
        var progress = await request.UploadAsync();

        if (progress.Status != Google.Apis.Upload.UploadStatus.Completed)
            throw new Exception($"Google Drive upload failed: {progress.Exception?.Message ?? "Unknown error"}");

        var file = request.ResponseBody;
        if (file == null)
            throw new Exception("Google Drive upload completed but returned no file metadata.");

        // Make the file publicly readable so it can be displayed in the frontend
        var permission = new Google.Apis.Drive.v3.Data.Permission
        {
            Type = "anyone",
            Role = "reader"
        };
        await _driveService.Permissions.Create(permission, file.Id).ExecuteAsync();

        return file.Id;
    }

    public async Task DeleteFileAsync(string fileId)
    {
        if (string.IsNullOrEmpty(fileId)) return;
        try
        {
            await _driveService.Files.Delete(fileId).ExecuteAsync();
        }
        catch { /* File may not exist on Drive */ }
    }
}
