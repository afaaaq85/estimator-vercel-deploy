import React, { useState, useEffect } from "react";
import "./ComponentDetailsPage.css";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { Toaster, toast } from "sonner";
import CallMissedOutgoingIcon from "@mui/icons-material/CallMissedOutgoing";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import { Tooltip } from "@mui/material";
import ExportIcon from "@mui/icons-material/IosShare";
import ExportCompsModal from "./ExportCompsModal";

const ComponentDetailsPage = () => {
  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 180,
      editable: true,
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      editable: true,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      width: 110,
      editable: true,
    },
    {
      field: "url",
      headerName: "URL",
      type: "url",
      sortable: false,
      width: 300,
      editable: true,
    },
    {
      field: "redirect",
      headerName: "Visit",
      type: "icon",
      sortable: false,
      width: 50,
      editable: false,
      renderCell: (params) => (
        <CallMissedOutgoingIcon
          className="visit-site-icon"
          onClick={() => handleVisitSite(params.row)}
          color="primary"
        ></CallMissedOutgoingIcon>
      ),
    },
    {
      field: "actions",
      headerName: "Save",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Button variant="outlined" onClick={() => handleUpdateButtonClick(params.row)}>
          Save
        </Button>
      ),
    },
    {
      field: "actions2",
      headerName: "Archive",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          onClick={() => handleArchiveButtonClick(params.row)}
          color="primary"
        >
          <i className="bi bi-archive"></i>
        </Button>
      ),
    },
    {
      field: "actions3",
      headerName: "Delete",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          onClick={() => handleDeleteButtonClick(params.row)}
          color="error"
        >
          <i className="bi bi-trash3-fill"></i>
        </Button>
      ),
    },
    {
      field: "actions4",
      headerName: "Last Update",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <ChangeCircleIcon
          className="visit-site-icon"
          onClick={() => handleShowUpdateDate(params.row)}
          color="primary"
        ></ChangeCircleIcon>
      ),
    },
  ];

  const [components, setComponents] = useState([]);
  const [rowSelectable, setRowSelectable] = useState(false);
  const [height, setHeight] = useState(500);
  const [showExportModal, setShowExportModal] = useState(false);
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let newHeight = 500; // Default height
      // Adjust height based on different screen widths
      if (windowWidth >= 3840) {
        newHeight = 1000; // Adjust height for 3840 width
      } else if (windowWidth >= 2560) {
        newHeight = 800; // Adjust height for 2560 width
      }
      // Set the new height
      setHeight(newHeight);
    };
    // Initial call to set height based on initial screen width
    handleResize();
    // Listen to window resize event
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchComponents = async () => {
      const response = await fetch(`${backendURL}/get-components-all`);
      if (response.status === 200) {
        const data = await response.json();
        setComponents(data);
      } else {
        console.error("Failed to fetch components");
      }
    };
    const fetchDataInterval = setInterval(() => {
      fetchComponents();
    }, 1000);
    return () => clearInterval(fetchDataInterval);
  }, []);

  const rows = components.map((component) => ({
    id: component._id,
    name: component.componentName,
    category: component.componentCategory,
    price: component.componentCost,
    url: component.componentUrl,
    date: component.componentDate,
  }));

  const handleUpdateButtonClick = async (row) => {
    console.log(row.id);
    const currentDate = new Date();

    try {
      const response = await fetch(`${backendURL}/updateComponent/${row.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compName: row.name,
          compCost: row.price,
          compUrl: row.url,
          compDate: currentDate,
          compCategory: row.category,
        }),
      });

      if (response.status === 200) {
        console.log("Component updated successfully");

        toast.success("Component updated successfully!");
      } else {
        console.error("Failed to update component in the database");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteButtonClick = async (row) => {
    console.log("item id for delete: ", row.id);
    try {
      const response = await fetch(`${backendURL}/remove-component?id=${row.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Component deleted successfully!");
      } else {
        toast.error("Some error occurred ");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVisitSite = (row) => {
    if (row.url) {
      window.open(row.url, "_blank");
    } else {
      toast.message("No URL found!");
    }
  };

  const handleArchiveButtonClick = async (row) => {
    fetch(`${backendURL}/archive-component/${row.id}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success("Component archived!");
      })
      .catch((error) => {
        toast.error("Error archiving component");
      });
  };

  const handleShowUpdateDate = (row) => {
    const newdate = new Date(row.date).toDateString();
    toast.message("Last updated", {
      description: newdate,
      duration: 1000,
    });
  };

  return (
    <div className="components-container">
      <div className="quote-btns">
            <Tooltip title="Export quotes" placement="top-start">
              <Button variant="outlined" onClick={() => setShowExportModal(true)}>
                {" "}
                <ExportIcon />{" "}
              </Button>
            </Tooltip>
          </div>
      <Box sx={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowSelection="false"
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>
      <ExportCompsModal show={showExportModal} onHide={() => setShowExportModal(false)} />
      <Toaster position="top-center" richColors visibleToasts={1} />
    </div>
  );
};

export default ComponentDetailsPage;
