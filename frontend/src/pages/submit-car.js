import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Delete, DeleteOutline, LogoutOutlined } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import api from "../utils/axios";

export default function SubmitCar() {
  const router = useRouter();
  const initialFormState = {
    model: "",
    price: "",
    phone: "",
    city: "Lahore",
    maxPictures: 1,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/");
    }
  }, [router]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const remainingSlots = formData.maxPictures - images.length;

      if (remainingSlots <= 0) {
        toast.error(`Maximum ${formData.maxPictures} pictures allowed`);
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      setImages((prevImages) => [
        ...prevImages,
        ...filesToAdd.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
    },
    [images, formData.maxPictures]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxSize: 5242880, // 5MB
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    // Clean up any image previews to prevent memory leaks
    images.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("model", formData.model);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("city", formData.city);

      // Append images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // Get token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.post("/cars", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Car listing submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.response?.data?.message || "Error submitting car listing"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/");
  };

  // Clean up image previews when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  // Create array of numbers 1-10 for dropdown options
  const maxPictureOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right bottom, #f3f4f6, #e5e7eb)",
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={handleLogout}
            color="primary"
            startIcon={<LogoutOutlined />}
            sx={{
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
              boxShadow: 1,
              px: 3,
              py: 1,
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, md: 5 }, background: "rgba(255, 255, 255, 0.9)" }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 4,
              color: "primary.main",
              textAlign: "center",
            }}
          >
            Submit Car Listing
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Car Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  inputProps={{ minLength: 3 }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  inputProps={{ maxLength: 11, minLength: 11 }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
                >
                  <MenuItem value="Lahore">Lahore</MenuItem>
                  <MenuItem value="Karachi">Karachi</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="max-pictures-label">
                    Maximum Pictures
                  </InputLabel>
                  <Select
                    labelId="max-pictures-label"
                    id="max-pictures"
                    name="maxPictures"
                    value={formData.maxPictures}
                    onChange={handleChange}
                    label="Maximum Pictures"
                  >
                    {maxPictureOptions.map((number) => (
                      <MenuItem key={number} value={number}>
                        {number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: "2px dashed",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <Typography color="primary">
                    Drag & drop images here, or click to select files
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {`${images.length}/${formData.maxPictures} pictures uploaded`}
                  </Typography>
                </Box>
              </Grid>

              {images.length > 0 && (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {images.map((file, index) => (
                      <Grid item xs={6} sm={4} md={3} key={file.preview}>
                        <Box
                          sx={{
                            position: "relative",
                            paddingTop: "100%",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="img"
                            src={file.preview}
                            alt={`Preview ${index + 1}`}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            onClick={() => removeImage(index)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "background.paper",
                              "&:hover": {
                                bgcolor: "error.light",
                                color: "white",
                              },
                            }}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || images.length === 0}
                    fullWidth
                  >
                    {loading ? "Submitting..." : "Submit Car Listing"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset Form
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
