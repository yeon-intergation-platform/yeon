package world.yeon.backend.card_rooms.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.card_rooms.dto.*;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.*;
import world.yeon.backend.card_rooms.service.CardRoomService;
import world.yeon.backend.card_rooms.service.CardRoomServiceException;

@RestController
@RequestMapping("/api/v1/card-rooms")
public class CardRoomController {
  private final CardRoomService service;
  public CardRoomController(CardRoomService service) { this.service = service; }

  @GetMapping
  public CardRoomListResponse listRooms() { return service.listRooms(); }

  @PostMapping
  public ResponseEntity<CardRoomResponse> createRoom(@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId, @RequestHeader(value = "X-Yeon-Guest-Id", required = false) String guestId, @RequestBody CreateCardRoomRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createRoom(userId, guestId, request));
  }

  @GetMapping("/{roomId}")
  public CardRoomResponse getRoom(@PathVariable String roomId) { return service.getRoom(roomId); }

  @PostMapping("/{roomId}/participants")
  public ResponseEntity<CardRoomParticipantResponse> join(@PathVariable String roomId, @RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId, @RequestHeader(value = "X-Yeon-Guest-Id", required = false) String guestId, @RequestBody JoinCardRoomRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.joinRoom(roomId, userId, guestId, request));
  }

  @PatchMapping("/{roomId}/participants/{participantId}")
  public CardRoomParticipantResponse updateParticipant(@PathVariable String roomId, @PathVariable String participantId, @RequestBody UpdateCardRoomParticipantRequest request) { return service.updateParticipant(roomId, participantId, request); }

  @DeleteMapping("/{roomId}/participants/{participantId}")
  public CardRoomResponse leave(@PathVariable String roomId, @PathVariable String participantId) { return service.leaveRoom(roomId, participantId); }

  @PostMapping("/{roomId}/start")
  public CardRoomResponse start(@PathVariable String roomId, @RequestHeader("X-Yeon-Participant-Id") String participantId) { return service.startRoom(roomId, participantId); }

  @PostMapping("/{roomId}/end")
  public CardRoomResponse end(@PathVariable String roomId, @RequestHeader("X-Yeon-Participant-Id") String participantId) { return service.endRoom(roomId, participantId); }

  @PostMapping("/{roomId}/messages")
  public CardRoomMessagesResponse message(@PathVariable String roomId, @RequestHeader("X-Yeon-Participant-Id") String participantId, @RequestBody CreateCardRoomMessageRequest request) { return service.addMessage(roomId, participantId, request); }

  @PostMapping("/{roomId}/results")
  public CardRoomResultResponse result(@PathVariable String roomId, @RequestHeader("X-Yeon-Participant-Id") String participantId, @RequestBody SubmitCardRoomResultRequest request) { return service.submitResult(roomId, participantId, request); }

  @PostMapping("/{roomId}/reveal")
  public CardRoomResponse reveal(@PathVariable String roomId, @RequestHeader("X-Yeon-Participant-Id") String participantId) { return service.reveal(roomId, participantId); }

  @PostMapping("/{roomId}/next")
  public CardRoomResponse next(@PathVariable String roomId, @RequestHeader("X-Yeon-Participant-Id") String participantId) { return service.next(roomId, participantId); }

  @ExceptionHandler(CardRoomServiceException.class)
  public ResponseEntity<ErrorResponse> serviceError(CardRoomServiceException error) { return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage())); }

  public record ErrorResponse(String code, String message) {}
}
