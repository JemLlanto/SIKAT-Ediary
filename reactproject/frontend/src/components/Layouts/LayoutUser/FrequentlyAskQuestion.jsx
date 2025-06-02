import { useState, useEffect } from "react";
import Accordion from "react-bootstrap/Accordion";
import axios from "axios";

const FrequentlyAskQuestion = () => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/faqs")
      .then((response) => {
        setFaqs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching FAQs:", error);
      });
  }, []);

  return (
    <div>
      <Accordion>
        {faqs.map((faq, index) => (
          <Accordion.Item key={faq.faqID} eventKey={String(index)}>
            <Accordion.Header>
              <h6 className="m-0">Q: {faq.question}</h6>
            </Accordion.Header>
            <Accordion.Body className="border-top">
              <p className="m-0 ms-2 text-secondary">A: {faq.answer}</p>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default FrequentlyAskQuestion;
