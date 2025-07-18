package com.back.teamcoffee.domain.order.order.service;


import com.back.teamcoffee.domain.order.order.dto.OrderDto;
import com.back.teamcoffee.domain.order.order.dto.OrderProductReq;
import com.back.teamcoffee.domain.order.order.dto.OrderStatusUpdateDto;
import com.back.teamcoffee.domain.order.order.dto.OrderWriteReqBody;
import com.back.teamcoffee.domain.order.order.entity.Order;
import com.back.teamcoffee.domain.order.order.repository.OrderRepository;
import com.back.teamcoffee.domain.order.orderItem.entity.OrderItem;
import com.back.teamcoffee.domain.order.orderItem.repository.OrderItemRepository;
import com.back.teamcoffee.domain.product.entity.Product;
import com.back.teamcoffee.domain.product.repository.ProductRepository;
import com.back.teamcoffee.global.exception.DataNotFoundException;
import com.back.teamcoffee.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final ProductRepository productRepository;

  public RsData<OrderDto> write(OrderWriteReqBody orderWriteReqBody) {
    List<OrderProductReq> orderProductReqs = orderWriteReqBody.products();


    // Product TotalPrice, TotalCount 변수
    AtomicInteger totalPrice = new AtomicInteger(0);
    AtomicInteger totalCount = new AtomicInteger(0);

    // ProductId로 상품 및 Total Price 계산 로직
    List<Product> products = orderProductReqs.stream()
        .map(req -> {
          Long productId = Long.parseLong(req.productId());
          Product product = productRepository.findById(productId)
              .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
          totalPrice.addAndGet(product.getPrice() * req.productCount());
          totalCount.addAndGet(req.productCount());
          return product;
        })
        .toList();

    // products에서 첫 번째 상품의 이름을 가져오기
    String firstProductName = products.getFirst().getProductName();
    int productsSize = orderWriteReqBody.products().size() - 1;
    // 주문 생성
    Order orderBuilder = Order.builder()
        .user("")
        .orderCount(totalCount.get())
        .productName(firstProductName + " 외 " + productsSize + "개")
        .totalPrice(totalPrice.get())
        .address(orderWriteReqBody.address())
        .email(orderWriteReqBody.userEmail())
        .build();

    Order order = orderRepository.save(orderBuilder);

    for (Product product : products) {
      OrderItem orderItemBuilder = OrderItem.builder()
          .order(order)
          .product(product)
          .productPrice(product.getPrice())
          .totalPrice(product.getPrice() * orderProductReqs.stream()
              .filter(req -> req.productId().equals(String.valueOf(product.getProductId())))
              .findFirst()
              .map(OrderProductReq::productCount)
              .orElse(0))
          .orderCount(orderProductReqs.stream()
              .filter(req -> req.productId().equals(String.valueOf(product.getProductId())))
              .findFirst()
              .map(OrderProductReq::productCount)
              .orElse(0))
          .build();

      OrderItem orderItem = orderItemRepository.save(orderItemBuilder);
      order.addOrderItem(orderItem);
    }


    OrderDto dtoList = new OrderDto(order);
    System.out.println("주문 정보:");
    System.out.println("주문 ID: " + order.getOrderId() + ", 주문자 이메일: " + order.getEmail() + ", 주문 총액: " + order.getTotalPrice() + "원, 주문 수량: " + order.getOrderCount() + ", 주소: " + order.getAddress());

    for (OrderItem orderItem : order.getOrderItems()) {
      System.out.println("주문 아이템 정보:");
      System.out.println(orderItem.getOrderItemId() + " - " + orderItem.getProduct().getProductName() + " - " + orderItem.getOrderCount() + "개 - " + orderItem.getTotalPrice() + "원");
    }

    return RsData.of("201-CREATED", "주문 생성 성공", dtoList);
  }

  public RsData<List<OrderDto>> findByEmail(String email) {
    List<Order> orders = orderRepository.findByEmailWithItems(email);
    System.out.println("Order : " + orders);
    if (orders.isEmpty()) {
      // 빈 리스트 반환 (에러 대신)
      return RsData.of("200-OK", "주문 내역이 없습니다.", List.of());
    }
    List<OrderDto> dtoList = orders.stream()
        .map(OrderDto::new)
        .toList();

    return RsData.of("200-OK", "주문 조회 성공", dtoList);
  }

  public RsData<OrderDto> findById(long orderId) {
    Optional<Order> order = orderRepository.findByIdWithItems(orderId);
    if (order.isPresent()) {
      OrderDto dto = new OrderDto(order.get());
      return RsData.of("200-OK", "주문 조회 성공", dto);
    } else {
      return RsData.of("404-NOT_FOUND", "주문을 찾을 수 없습니다.", null);
    }
  }


  public RsData<OrderDto> modifyOrder(OrderDto orderDto) {
    System.out.println("OrderStatus: " + orderDto.orderStatus());
    Optional<Order> optionalOrder = orderRepository.findById(orderDto.orderId());
    if (optionalOrder.isEmpty()) {
      return RsData.of("404-NOT_FOUND", "주문을 찾을 수 없습니다.", null);
    }

    Order order = optionalOrder.get();
    System.out.println("Order Status: " + order.getOrderStatus());

    order.modify(orderDto.orderStatus());

    Order updatedOrder = orderRepository.save(order);
    OrderDto updatedDto = new OrderDto(updatedOrder);

    return RsData.of("200-OK", "주문 상태 변경 성공", updatedDto);
  }
  
  public RsData<OrderDto> modifyOrderStatus(OrderStatusUpdateDto orderStatusUpdateDto) {
    System.out.println("OrderStatus: " + orderStatusUpdateDto.orderStatus());
    Optional<Order> optionalOrder = orderRepository.findById(orderStatusUpdateDto.orderId());
    if (optionalOrder.isEmpty()) {
      return RsData.of("404-NOT_FOUND", "주문을 찾을 수 없습니다.", null);
    }

    Order order = optionalOrder.get();
    System.out.println("Order Status: " + order.getOrderStatus());

    order.modify(orderStatusUpdateDto.orderStatus());

    Order updatedOrder = orderRepository.save(order);
    OrderDto updatedDto = new OrderDto(updatedOrder);

    return RsData.of("200-OK", "주문 상태 변경 성공", updatedDto);
  }

  public RsData<OrderDto> deleteOrder(long orderId) {
    Optional<Order> optionalOrder = orderRepository.findById(orderId);
    if (optionalOrder.isEmpty()) {
      return RsData.of("404-NOT_FOUND", "주문을 찾을 수 없습니다.", null);
    }

    Order order = optionalOrder.get();
    orderRepository.delete(order);

    OrderDto deletedDto = new OrderDto(order);
    return RsData.of("200-OK", "주문 취소 성공", deletedDto);
  }

  public RsData<List<OrderDto>> findTodayOrders() {
    ZoneId zoneKST = ZoneId.of("Asia/Seoul");

    LocalDateTime todayAt2pm = LocalDate.now(zoneKST).atTime(14, 0);
    LocalDateTime yesterdayAt2pm = todayAt2pm.minusDays(1);

    List<Order> orders = orderRepository.findByCreatedAtBetweenWithItems(yesterdayAt2pm, todayAt2pm);

    orders.forEach(order -> {
      System.out.println("Order ID: " + order.getOrderId() + ", Created At: " + order.getCreatedAt());
    });

    if (orders.isEmpty()) {
      throw new DataNotFoundException("오늘 주문 내역이 없습니다.");
    }

    List<OrderDto> todayOrders = orders.stream()
        .map(OrderDto::new)
        .toList();

    return RsData.of("200-OK", "오늘 주문 내역 조회 성공", todayOrders);
  }
}