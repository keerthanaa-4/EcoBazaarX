import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import { Modal, Button, Form } from "react-bootstrap";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/seller/products", { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEditClick = (product = null) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (currentProduct.id) {
        // Edit product
        await axios.put(`/seller/products/${currentProduct.id}`, currentProduct, { headers: { Authorization: `Bearer ${token}` } });
        setProducts(products.map(p => (p.id === currentProduct.id ? currentProduct : p)));
      } else {
        // Add new product
        const res = await axios.post("/seller/products", currentProduct, { headers: { Authorization: `Bearer ${token}` } });
        setProducts([...products, res.data]);
      }
      setShowModal(false);
      setCurrentProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/seller/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">My Products</h2>
        <Button variant="success" onClick={() => handleAddEditClick()}>+ Add Product</Button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Carbon Score</th>
            <th className="border p-2">Eco Label</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">₹{p.price}</td>
              <td className="border p-2">{p.carbon_score}</td>
              <td className="border p-2">{p.eco_label}</td>
              <td className="border p-2 flex gap-2">
                <Button variant="warning" size="sm" onClick={() => handleAddEditClick(p)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentProduct?.id ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={currentProduct?.name || ""} onChange={e => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" value={currentProduct?.category || ""} onChange={e => setCurrentProduct(prev => ({ ...prev, category: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={currentProduct?.price || ""} onChange={e => setCurrentProduct(prev => ({ ...prev, price: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Carbon Score</Form.Label>
              <Form.Control type="number" value={currentProduct?.carbon_score || ""} onChange={e => setCurrentProduct(prev => ({ ...prev, carbon_score: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Eco Label</Form.Label>
              <Form.Control type="text" value={currentProduct?.eco_label || ""} onChange={e => setCurrentProduct(prev => ({ ...prev, eco_label: e.target.value }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSaveProduct}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyProducts;
