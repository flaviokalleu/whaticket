import React, { useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@mui/icons-material";
import TagModal from "../../components/TagModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((t) => t.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((t) => t.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;
    const tagIndex = state.findIndex((t) => t.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Tags = () => {
  const [tags, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tags");
        dispatch({ type: "LOAD_TAGS", payload: data });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("tag", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAG", payload: data.tagId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenTagModal = () => {
    setTagModalOpen(true);
    setSelectedTag(null);
  };

  const handleCloseTagModal = () => {
    setTagModalOpen(false);
    setSelectedTag(null);
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedTag(null);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setSelectedTag(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedTag &&
          `${i18n.t("tags.confirmationModal.deleteTitle")} ${
            selectedTag.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteTag(selectedTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        tagId={selectedTag?.id}
      />
      <MainHeader>
        <Title>{i18n.t("tags.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        sx={(theme) => ({
          flex: 1,
          padding: theme.spacing(1),
          overflowY: "scroll",
          ...theme.scrollbarStyles,
        })}
        variant="outlined"
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("tags.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.color")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell align="center">{tag.name}</TableCell>
                  <TableCell align="center">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        style={{
                          backgroundColor: tag.color,
                          width: 60,
                          height: 20,
                          alignSelf: "center",
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTag(tag);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Tags;
