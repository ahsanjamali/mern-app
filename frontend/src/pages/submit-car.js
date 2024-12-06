import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: formData.maxPictures,
    onDrop: (acceptedFiles) => {
      if (images.length + acceptedFiles.length > formData.maxPictures) {
        toast.error(`Maximum ${formData.maxPictures} images allowed`);
        return;
      }

      setImages([
        ...images,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
    },
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right bottom, #f3f4f6, #e5e7eb)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            background: "rgba(255, 255, 255, 0.9)",
          }}
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
                    bgcolor: "white",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.dark",
                      bgcolor: "rgba(37, 99, 235, 0.04)",
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <Typography color="primary">
                    Drag & drop images here, or click to select files
                  </Typography>
                </Box>
              </Grid>

              {images.length > 0 && (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {images.map((file, index) => (
                      <Grid item key={index} xs={6} sm={4} md={3}>
                        <Box
                          sx={{
                            position: "relative",
                            paddingTop: "100%",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="img"
                            src={file.preview}
                            alt={`Preview ${index}`}
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
                              bgcolor: "rgba(255, 255, 255, 0.8)",
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                              },
                            }}
                          >
                            <Delete />
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
                    disabled={loading}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      "&:hover": {
                        transform: "translateY(-1px)",
                        transition: "transform 0.2s",
                      },
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Car Listing"}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={resetForm}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        transform: "translateY(-1px)",
                        transition: "transform 0.2s",
                      },
                    }}
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
