namespace PersonalLifeOS.Infrastructure.FileStorage;

public class FileStorageService
{
    private readonly string _uploadPath;

    public FileStorageService(string uploadPath)
    {
        _uploadPath = uploadPath;
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(_uploadPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        return uniqueFileName;
    }

    public void DeleteFile(string fileName)
    {
        var filePath = Path.Combine(_uploadPath, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    public string GetFilePath(string fileName)
    {
        return Path.Combine(_uploadPath, fileName);
    }
}
