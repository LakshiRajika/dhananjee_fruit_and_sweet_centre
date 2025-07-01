import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashPosts() {
  const [posts, setPosts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedPost, setEditedPost] = useState({
    title: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    setPosts(storedPosts.reverse()); // show newest first
  }, []);

  const deletePost = (indexToDelete) => {
    const updated = [...posts];
    updated.splice(indexToDelete, 1);
    setPosts(updated);
    localStorage.setItem("posts", JSON.stringify([...updated].reverse()));
    toast.success("Post deleted successfully!");
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditedPost({
      title: posts[index].title,
      description: posts[index].description,
      image: posts[index].image,
    });
  };

  const saveEdit = (index) => {
    const updated = [...posts];
    updated[index].title = editedPost.title;
    updated[index].description = editedPost.description;
    updated[index].image = editedPost.image;
    setPosts(updated);
    localStorage.setItem("posts", JSON.stringify([...updated].reverse()));
    setEditingIndex(null);
    toast.success("Post updated successfully!");
  };

  return (
    <div className="p-4 bg-white text-black dark:bg-[#0f172a] dark:text-white min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Centered Title */}
      <div className="flex justify-center">
        <h1 className="text-3xl font-bold mb-8">Dashboard Posts</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center dark:text-gray-300">
          No posts available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {posts.map((post, index) => (
            <div
              key={index}
              className="border rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800"
            >
              {editingIndex === index ? (
                <div className="p-4">
                  <input
                    type="text"
                    value={editedPost.title}
                    onChange={(e) =>
                      setEditedPost({ ...editedPost, title: e.target.value })
                    }
                    className="w-full border rounded p-2 mb-2 dark:bg-gray-700 dark:text-white"
                  />

                  <textarea
                    value={editedPost.description}
                    onChange={(e) =>
                      setEditedPost({
                        ...editedPost,
                        description: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2 mb-2 dark:bg-gray-700 dark:text-white"
                  />

                  {editedPost.image && (
                    <img
                      src={editedPost.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditedPost({
                          ...editedPost,
                          image: reader.result,
                        });
                      };
                      if (file) {
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="mb-2"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(index)}
                      className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-1 rounded-md font-semibold hover:opacity-90 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-1 rounded-md font-semibold hover:opacity-90 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                    <p className="text-gray-700 text-sm dark:text-gray-300 mb-2">
                      {post.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mb-2">
                      Posted on{" "}
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(index)}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-1 rounded-md font-semibold hover:opacity-90 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePost(index)}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded-md font-semibold hover:opacity-90 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}