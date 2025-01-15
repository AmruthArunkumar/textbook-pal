import os

class TempFile:
    def __init__(self, name, value):
        # This assumes Unix-like filesystem.
        # Consider using the tempfile module to make it cross-platform
        self.name = name
        self.value = value

    def __enter__(self):
        file_path = os.path.join(self.name)
        with open(file_path, 'wb') as f:
            f.write(self.value)
        return file_path

    def __exit__(self, exc_type, exc_value, exc_traceback):
        file_path = os.path.join(self.name)
        os.remove(file_path)
        return False