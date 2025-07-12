import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { auth, db } from "../Firebase/firebase";
import { JobApplication } from "../types";
import { JOB_TYPES, APPLICATION_STATUS } from "../constants";
import Button from "../MyComponents/Button";
import Select from "../MyComponents/Select";
import TextInput from "../MyComponents/TextInput";
import TextArea from "../MyComponents/TextArea";
import DatePicker from "../MyComponents/DatePicker";
import UrlInput from "../MyComponents/UrlInput";
import {
  faPlus,
  faTimes,
  faSave,
  faTimes as faCancel,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/form.module.css";
import { strings } from "../locals";

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<JobApplication>>({
    companyName: "",
    jobTitle: "",
    jobType: "full-time",
    location: "",
    dateApplied: new Date().toISOString().split("T")[0],
    status: "applied",
    jobUrl: "",
    meetingUrl: "",
    otherUrls: [{ name: "", url: "" }],
    jobDescription: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(
    async (applicationId: string) => {
      try {
        setLoading(true);
        const docRef = doc(db, "applications", applicationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data() as JobApplication);
        } else {
          setError("Application not found");
          navigate("/home");
        }
      } catch (err) {
        console.error("Error fetching application:", err);
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (isEditing && id) {
      fetchApplication(id);
    }
  }, [id, isEditing, navigate, fetchApplication]);

  const validateDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();

    // Set both dates to start of day for comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate <= today;
  };

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    if (field === "dateApplied") {
      const selectedDate = new Date(value);
      const today = new Date();

      // Set both dates to start of day for comparison
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        setError("Date applied cannot be in the future");
        return;
      }
    }
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDate(formData.dateApplied || "")) {
      setError("Date applied cannot be in the future");
      return;
    }

    if (!formData.companyName || !formData.jobTitle || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      const applicationData = {
        ...formData,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, "applications", id), applicationData);
      } else {
        applicationData.createdAt = new Date().toISOString();
        await addDoc(collection(db, "applications"), applicationData);
      }

      navigate("/home");
    } catch (err) {
      console.error("Error saving application:", err);
      setError("Failed to save application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtherUrlChange = (
    index: number,
    field: "name" | "url",
    value: string
  ) => {
    const newOtherUrls = [...(formData.otherUrls || [{ name: "", url: "" }])];
    newOtherUrls[index] = { ...newOtherUrls[index], [field]: value };
    setFormData((prev) => ({ ...prev, otherUrls: newOtherUrls }));
  };

  const addOtherUrl = () => {
    setFormData((prev) => ({
      ...prev,
      otherUrls: [...(prev.otherUrls || []), { name: "", url: "" }],
    }));
  };

  const removeOtherUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherUrls: prev.otherUrls?.filter((_, i) => i !== index) || [
        { name: "", url: "" },
      ],
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1>
            {isEditing
              ? strings.dashboard.table.actions.edit
              : strings.dashboard.table.actions.add}
          </h1>
          <p>
            {isEditing
              ? strings.dashboard.table.actions.editSubtitle
              : strings.dashboard.table.actions.addSubtitle}
          </p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form
          onSubmit={handleSubmit}
          className={`${styles.form} ${loading ? styles.loading : ""}`}
        >
          <div className={styles.formGrid}>
            <TextInput
              label={strings.dashboard.table.headers.company}
              value={formData.companyName || ""}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              required
            />
            <TextInput
              label={strings.dashboard.table.headers.jobTitle}
              value={formData.jobTitle || ""}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              required
            />
            <Select
              label={strings.dashboard.table.headers.type}
              options={JOB_TYPES}
              value={formData.jobType || "full-time"}
              onChange={(value) => handleInputChange("jobType", value)}
              required
            />
            <TextInput
              label={strings.dashboard.table.headers.location}
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
            <DatePicker
              label={strings.dashboard.table.headers.dateApplied}
              value={formData.dateApplied || ""}
              onChange={(e) => handleInputChange("dateApplied", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
            <Select
              label={strings.dashboard.table.headers.status}
              options={APPLICATION_STATUS}
              value={formData.status || "applied"}
              onChange={(value) => handleInputChange("status", value)}
              required
            />
            <UrlInput
              label={strings.dashboard.table.headers.jobUrl}
              value={formData.jobUrl || ""}
              onChange={(e) => handleInputChange("jobUrl", e.target.value)}
              placeholder={strings.dashboard.table.headers.jobUrlPlaceholder}
            />
            <UrlInput
              label={strings.dashboard.table.headers.meetingUrl}
              value={formData.meetingUrl || ""}
              onChange={(e) => handleInputChange("meetingUrl", e.target.value)}
              placeholder={
                strings.dashboard.table.headers.meetingUrlPlaceholder
              }
            />
            <div className={styles.otherUrls}>
              <label>Other URLs</label>
              {formData.otherUrls?.map((urlItem, index) => (
                <div key={index} className={styles.otherUrlInput}>
                  <div className={styles.urlFields}>
                    <TextInput
                      label={`URL Name ${index + 1}`}
                      value={urlItem.name}
                      onChange={(e) =>
                        handleOtherUrlChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Company Website, LinkedIn"
                    />
                    <UrlInput
                      label={`URL ${index + 1}`}
                      value={urlItem.url}
                      onChange={(e) =>
                        handleOtherUrlChange(index, "url", e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="danger"
                      icon={faTimes}
                      onClick={() => removeOtherUrl(index)}
                      className={styles.removeButton}
                    />
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                icon={faPlus}
                onClick={addOtherUrl}
                className={styles.addButton}
              >
                Add Other URL
              </Button>
            </div>
            <div className={styles.textAreaSection}>
              {/* <RichTextEditor
                label={strings.dashboard.table.headers.jobDescription}
                value={formData.jobDescription || ''}
                onChange={(value) => handleInputChange('jobDescription', value)}
                placeholder={strings.dashboard.table.headers.jobDescriptionPlaceholder}
              /> */}
              <TextArea
                label={strings.dashboard.table.headers.jobDescription}
                value={formData.jobDescription || ""}
                onChange={(e) =>
                  handleInputChange("jobDescription", e.target.value)
                }
                placeholder={
                  strings.dashboard.table.headers.jobDescriptionPlaceholder
                }
              />
              <TextArea
                label={strings.dashboard.table.headers.notes}
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder={strings.dashboard.table.headers.notesPlaceholder}
              />
            </div>
            <div className={styles.buttons}>
              <Button type="submit" icon={faSave} isLoading={loading}>
                {isEditing
                  ? strings.dashboard.table.actions.update
                  : strings.dashboard.table.actions.add}
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={faCancel}
                onClick={() => navigate("/home")}
              >
                {strings.form.validation.cancel || "Cancel"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
