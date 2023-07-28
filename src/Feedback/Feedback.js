import React, { useState } from 'react';
import './feedback-form.css';

const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
    // You can perform additional validation or API calls here
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Rating:', rating);
    console.log('Comments:', comments);
    console.log('Suggestions:', suggestions);

    // Reset form fields
    setName('');
    setEmail('');
    setRating('');
    setComments('');
    setSuggestions('');
  };

  const handleClose = () => {
    setShowForm(false);
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="overlay-container">
      <div className="overlay">
        <div className="form-container">
        <button className="close-button" onClick={handleClose}>
            X
          </button>
          <h2>Browsing Experience Feedback</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="rating">Rating:</label>
              <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">Select rating</option>
                <option value="1">1 star</option>
                <option value="2">2 stars</option>
                <option value="3">3 stars</option>
                <option value="4">4 stars</option>
                <option value="5">5 stars</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comments">Comments:</label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="suggestions">Suggestions:</label>
              <textarea
                id="suggestions"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
              ></textarea>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
