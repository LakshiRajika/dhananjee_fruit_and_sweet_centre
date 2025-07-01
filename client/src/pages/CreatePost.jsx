import React, { useState } from "react";
import { useSelector } from "react-redux";
import { message } from "antd";

export default function CreatePost() {
  const { currentUser } = useSelector((state) => state.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newPost = {
        title,
        description,
        image: imageBase64,
        createdAt: new Date().toISOString(),
        userId: currentUser._id,
        username: currentUser.username,
        userProfilePicture: currentUser.profilePicture,
      };

      const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
      storedPosts.push(newPost);
      localStorage.setItem("posts", JSON.stringify(storedPosts));

      setTitle("");
      setDescription("");
      setImageBase64("");
      message.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white text-black dark:bg-gray-900 dark:text-white rounded-xl shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Create Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            className="w-full p-2 border rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter post description"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mt-1 dark:bg-gray-800 dark:text-white"
          />
          <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
        </div>

        {imageBase64 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Preview:</p>
            <img
              src={imageBase64}
              alt="Preview"
              className="mt-1 rounded w-full h-auto max-h-60 object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded hover:opacity-90 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Creating Post..." : "Submit Post"}
        </button>
      </form>
    </div>
  );
}
