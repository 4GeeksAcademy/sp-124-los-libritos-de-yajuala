import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ChatBotButton() {
    const navigate = useNavigate();

    return (
        <button
            className="
        btn btn-primary 
        position-fixed 
        bottom-0 end-0 
        m-4 
        rounded-circle 
        d-flex align-items-center justify-content-center
        shadow
      "
            style={{ width: "60px", height: "60px", fontSize: "28px" }}
            onClick={() => navigate("/chat")}
        >
            <FontAwesomeIcon icon={faRobot} />
        </button>
    );
}
