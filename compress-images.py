from PIL import Image

def compress_image(input_path, output_path, quality=85):
    """
    Compress an image and save it to a new file.

    Parameters:
    - input_path (str): Path to the input image file.
    - output_path (str): Path to save the compressed image.
    - quality (int, optional): The quality of the output image (1-100). Default is 85.
    """
    # Open an image file
    with Image.open(input_path) as img:
        # Save the image with the specified quality
        img.save(output_path, 'JPEG', quality=quality)

# Example usage:
input_image_path = 'images/krpai1.jpg'
output_image_path = 'images/compressed_image.jpg'
compress_image(input_image_path, output_image_path, quality=int(input("Masukkan persentase kualitas gambar: ")))
