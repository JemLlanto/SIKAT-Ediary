import HomeMainLayout from "../../Layouts/Home/HomeMainLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";

export default function AdminHome() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, message: "" });
  const closeModal = () => {
    setModal({ show: false, message: "" });
  };

  const redirect = () => {
    navigate("/Home");
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (!parsedUser.isAdmin || !parsedUser.isAdmin == 2) {
        setModal({
          show: true,
          message: `Permission Denied: You are not authorized to access this page.`,
        });
        setTimeout(() => {
          redirect();
        }, 1500);
      }
    } else {
      navigate("/");
    }

    setIsLoading(false);
  }, [navigate]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>

      <HomeMainLayout isAdminPage={true} />
    </>
  );
}
