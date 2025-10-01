import React, { useState } from "react";
import { Button, Table, Form } from "react-bootstrap";

export default function ReviewsTable({ reviews, onReply }) {
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleReplyClick = (review) => {
    setReplyingId(review.review_id); // start replying to this review
    setReplyText(review.reply || ""); // preload if already replied
  };

  const handleCancel = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const handleSend = () => {
    if (!replyText.trim()) {
      alert("Reply cannot be empty");
      return;
    }
    onReply(replyingId, replyText);
    setReplyingId(null);
    setReplyText("");
  };

  return (
    <Table striped bordered hover responsive>
      <thead className="table-success">
        <tr>
          <th>Product</th>
          <th>Customer</th>
          <th>Rating</th>
          <th>Comment</th>
          <th>Reply</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {reviews.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center">No reviews yet</td>
          </tr>
        ) : (
          reviews.map((review) => (
            <tr key={review.review_id}>
              <td>{review.product_name}</td>
              <td>{review.customer_id}</td>
              <td>{review.rating} ⭐</td>
              <td>{review.comment}</td>
              <td>
                {replyingId === review.review_id ? (
                  <Form.Control
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                  />
                ) : (
                  review.reply || <span className="text-muted">No reply</span>
                )}
              </td>
              <td>
                {replyingId === review.review_id ? (
                  <>
                    <Button variant="success" size="sm" onClick={handleSend}>
                      Send
                    </Button>{" "}
                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleReplyClick(review)}
                  >
                    Reply
                  </Button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}
