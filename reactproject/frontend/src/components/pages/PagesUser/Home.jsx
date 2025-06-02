import HomeMainLayout from "../../Layouts/Home/HomeMainLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, message: "" });
  const closeModal = () => {
    setModal({ show: false, message: "" });
  };

  const redirect = () => {
    navigate("/Admin/Home");
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.isAdmin) {
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

  return (
    <>
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>
      <HomeMainLayout />
    </>
  );
}
