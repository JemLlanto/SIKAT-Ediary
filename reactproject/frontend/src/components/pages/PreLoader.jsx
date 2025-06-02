import react, { useEffect } from "react";
import { preLoaderAnim } from "../Animation/PreLoaderAnim";
import logo from "../../assets/TransparentLogo.png";

export const PreLoader = () => {
  useEffect(() => {
    preLoaderAnim();
  }, []);
  return (
    <div className="preloader">
      <div>
        <img src={logo} alt="" />
      </div>
      <div className="text-container w-100 flex-wrap justify-content-center">
        <span>
          <h5>Equality, </h5>
        </span>
        <span>
          <h5>Empowerment, </h5>
        </span>
        <span>
          <h5>Inclusivity</h5>
        </span>
      </div>
    </div>
  );
};
