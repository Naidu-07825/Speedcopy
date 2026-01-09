import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import API, { BACKEND_ORIGIN } from "../services/api";
import { getCroppedImg } from "../utils/cropImage";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) return <div className="text-center mt-5">Please login</div>;

  
  const avatarUrl = user.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : BACKEND_ORIGIN + user.avatar
    : "/default-avatar.png";

  
  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };


  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  
  const uploadCroppedImage = async () => {
    try {
      const token = localStorage.getItem("token");
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );

      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.jpg");

      const res = await API.put("/user/avatar", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = { ...user, avatar: res.data.avatar };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      window.dispatchEvent(new Event("userUpdated"));
      setShowCrop(false);
      alert("🖼️ Profile picture updated");
    } catch (err) {
      console.error(err);
      alert("Avatar upload failed");
    }
  };

 
  const saveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await API.put(
        "/user/update",
        { name: user.name, phone: user.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mergedUser = {
        ...JSON.parse(localStorage.getItem("user")),
        ...res.data.user,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      setUser(mergedUser);

      window.dispatchEvent(new Event("userUpdated"));
      setEditing(false);
      alert("✅ Profile updated");
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 500 }}>
        <h3 className="text-center mb-3">👤 My Profile</h3>

       
        <div className="text-center mb-3">
          <img
            src={avatarUrl}
            alt="avatar"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #0d6efd",
            }}
          />

          {user.isGoogleUser && (
            <div className="mt-2">
              <span className="badge bg-danger">Google Account</span>
            </div>
          )}
        </div>

       
        {!user.isGoogleUser && (
          <input
            type="file"
            className="form-control mb-3"
            accept="image/*"
            onChange={onFileChange}
          />
        )}

        <hr />

       
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            value={user.name}
            disabled={!editing || user.isGoogleUser}
            onChange={(e) =>
              setUser({ ...user, name: e.target.value })
            }
          />
        </div>

       
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={user.email} disabled />
        </div>

       
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            className="form-control"
            value={user.phone || ""}
            disabled={!editing}
            onChange={(e) =>
              setUser({ ...user, phone: e.target.value })
            }
          />
        </div>

        
        <div className="mb-3">
          <label className="form-label">🎁 Referral Code</label>
          <input className="form-control" value={user.referralCode} disabled />
        </div>

       
        <div className="mb-3">
          <label className="form-label">⭐ Loyalty Points</label>
          <input
            className="form-control"
            value={user.loyaltyPoints ?? 0}
            disabled
          />
        </div>

       
        {!user.isGoogleUser &&
          (editing ? (
            <div className="d-flex gap-2 mb-3">
              <button
                className="btn btn-success w-100"
                onClick={saveProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="btn btn-secondary w-100"
                onClick={() => {
                  setUser(JSON.parse(localStorage.getItem("user")));
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary w-100 mb-3"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          ))}

        <hr />

        
        <h5 className="text-center mb-3">🎁 Referral Program</h5>

        <div className="alert alert-success text-center">
          <b>Your Referral Code</b>
          <h4 className="mt-2">{user.referralCode}</h4>
        </div>

        <button
          className="btn btn-outline-primary w-100 mb-2"
          onClick={() => copyText(user.referralCode)}
        >
          📋 Copy Referral Code
        </button>

        <button
          className="btn btn-outline-success w-100"
          onClick={() => copyText(referralLink)}
        >
          🔗 Copy Referral Link
        </button>

        <hr />

        <div className="d-grid gap-2">
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) return;
              try {
                const token = localStorage.getItem("token");
                await API.delete("/user/delete", { headers: { Authorization: `Bearer ${token}` } });
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("userUpdated"));
                alert("Account deleted. Redirecting to home.");
                window.location.href = "/";
              } catch (err) {
                alert(err.response?.data?.message || "Failed to delete account");
              }
            }}
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>

     
      {showCrop && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center">
          <div className="bg-white p-3 rounded" style={{ width: 350 }}>
            <div style={{ position: "relative", height: 300 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="form-range mt-2"
            />

            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCrop(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={uploadCroppedImage}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
